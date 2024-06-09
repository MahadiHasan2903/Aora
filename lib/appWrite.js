import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";

// Appwrite configuration
export const appWriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.mh.aora",
  projectId: "66648545002420c91805",
  storageId: "66648801001a3276571f",
  databaseId: "66648655002ca3283016",
  userCollectionId: "6665a735003314d4a2c4",
  videoCollectionId: "6664868e0016a164cfd3",
};

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(appWriteConfig.endpoint)
  .setProject(appWriteConfig.projectId)
  .setPlatform(appWriteConfig.platform);

// Initialize Appwrite services
const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

// Register User
export const register = async (email, password, username) => {
  try {
    // Create new account
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) {
      throw new Error("Account creation failed");
    }

    // Generate avatar URL
    const avatarUrl = avatars.getInitials(username);

    // Sign in the new user
    await logIn(email, password);

    const { databaseId, userCollectionId } = appWriteConfig;

    // Create user document in the database
    const newUser = await databases.createDocument(
      databaseId,
      userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    console.error("Error registering user:", error);
    throw new Error(error.message);
  }
};

// Log In User
export const logIn = async (email, password) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);

    return session;
  } catch (error) {
    throw new Error(error);
  }
};

// Log Out User
export const logOut = async () => {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    console.error("Error logging out user:", error);
    throw new Error(error.message);
  }
};

// Get Current Account
export const getAccount = async () => {
  try {
    const currentAccount = await account.get();
    return currentAccount;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get Current User Document
export const getCurrentUser = async () => {
  try {
    // Get current account
    const currentAccount = await getAccount();
    if (!currentAccount) {
      throw new Error("No current account found");
    }

    const { databaseId, userCollectionId } = appWriteConfig;

    // Get user document from the database
    const currentUser = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) {
      throw new Error("No user document found");
    }

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Function to fetch all video posts from the AppWrite database
export const getAllPosts = async () => {
  try {
    const { databaseId, videoCollectionId } = appWriteConfig;
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.orderDesc("$createdAt"),
    ]);

    return posts.documents;
  } catch (error) {
    console.error("Error fetching video posts:", error);
    throw new Error("Failed to fetch video posts");
  }
};

// Get latest created video posts
export const getLatestPosts = async () => {
  try {
    const { databaseId, videoCollectionId } = appWriteConfig;
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.orderDesc("$createdAt"),
      Query.limit(7),
    ]);

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

// Get video posts that matches search query
export const searchPosts = async (query) => {
  try {
    const { databaseId, videoCollectionId } = appWriteConfig;

    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.search("title", query),
    ]);

    if (!posts) throw new Error("Something went wrong");

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

// Get video posts created by user
export const getUserPosts = async (userId) => {
  try {
    const { databaseId, videoCollectionId } = appWriteConfig;

    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.equal("users", userId),
    ]);
    console.log(posts);

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

// Upload File
export const uploadFile = async (file, type) => {
  if (!file) return;

  const asset = {
    name: file.fileName,
    type: file.mimeType,
    size: file.fileSize,
    uri: file.uri,
  };

  try {
    const uploadedFile = await storage.createFile(
      appWriteConfig.storageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type);
    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
};

// Get File Preview
export const getFilePreview = async (fileId, type) => {
  let fileUrl;

  try {
    if (type === "video") {
      fileUrl = storage.getFileView(appWriteConfig.storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        appWriteConfig.storageId,
        fileId,
        2000,
        2000,
        "top",
        100
      );
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) {
      throw Error;
    }

    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
};

// Create Video Post
export const createVideoPost = async (form) => {
  try {
    const { databaseId, videoCollectionId } = appWriteConfig;

    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ]);

    const newPost = await databases.createDocument(
      databaseId,
      videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt: form.prompt,
        users: form.userId,
      }
    );

    return newPost;
  } catch (error) {
    throw new Error(error);
  }
};
