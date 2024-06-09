import React, { useState } from "react";
import { View, Text, FlatList, Image, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SearchInput, EmptyState, VideoCard } from "../../components";
import { getAllPosts } from "@/lib/appWrite";
import useAppWrite from "../../lib/useAppWrite";

const Bookmark = () => {
  const { data: posts, refetch } = useAppWrite(getAllPosts);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);

    // Re fetching the  videos
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="bg-primary">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <VideoCard
            title={item.title}
            thumbnail={item.thumbnail}
            video={item.video}
            creator={item.users?.username}
            avatar={item.users?.avatar}
          />
        )}
        ListHeaderComponent={() => (
          <View className="flex px-4 my-6 space-y-6">
            <View className="flex flex-row items-start justify-between mb-6">
              <Text className="text-2xl text-white font-psemibold">
                Bookmarked videos,
              </Text>
            </View>

            <SearchInput />
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos created yet"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Bookmark;
