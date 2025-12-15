"use server";

/**
 * YouTube 채널 분석 (영상 목록, 조회수, 썸네일, 제목, 댓글수, 좋아요)
 */
export async function analyzeYouTubeChannel(channelIdOrUsername: string) {
  console.log(`[analyzeYouTubeChannel] ========== 시작 ==========`);
  console.log(`[analyzeYouTubeChannel] 입력:`, channelIdOrUsername);

  try {
    const apiKey = process.env.YOUTUBE_DATA_API_STEP4_KEY;

    if (!apiKey) {
      console.error(`[analyzeYouTubeChannel] API 키 없음`);
      return {
        success: false,
        error: "YouTube Data API 키가 설정되지 않았습니다.",
      };
    }

    // 1. 채널 ID 확인 (username이면 채널 ID로 변환)
    let channelId = channelIdOrUsername;

    // username 형식인 경우 (예: @username 또는 username)
    if (!channelId.startsWith("UC") && !channelId.startsWith("@")) {
      // @ 없이 입력된 경우 @ 추가
      if (!channelId.startsWith("@")) {
        channelId = `@${channelId}`;
      }
    }

    console.log(`[analyzeYouTubeChannel] 채널 ID/Username:`, channelId);

    // 2. 채널 정보 가져오기
    let channelInfo;
    if (channelId.startsWith("@")) {
      // Handle로 채널 찾기 (forHandle 파라미터 사용)
      const handle = channelId.replace("@", "");
      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&forHandle=${handle}&key=${apiKey}`
      );
      console.log(
        `[analyzeYouTubeChannel] channelResponse status:`,
        channelResponse.status,
        channelResponse.ok
      );

      const channelData = await channelResponse.json();
      console.log(`[analyzeYouTubeChannel] channelData:`, {
        items: channelData.items,
        itemsLength: channelData.items?.length,
        pageInfo: channelData.pageInfo,
        error: channelData.error,
        fullData: JSON.stringify(channelData, null, 2),
      });

      // 응답이 성공하고 items가 있는 경우
      if (
        channelResponse.ok &&
        channelData.items &&
        channelData.items.length > 0
      ) {
        console.log(`[analyzeYouTubeChannel] forHandle 성공! 채널 정보:`, {
          id: channelData.items[0]?.id,
          title: channelData.items[0]?.snippet?.title,
        });
        channelInfo = channelData.items[0];
      }
      // else {
      //   console.log(
      //     `[analyzeYouTubeChannel] forHandle 실패 또는 items 없음, forUsername으로 시도`
      //   );
      //   // forHandle이 실패하면 forUsername으로 시도 (레거시 지원)
      //   const usernameResponse = await fetch(
      //     `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&forUsername=${handle}&key=${apiKey}`
      //   );
      //   console.log(
      //     `[analyzeYouTubeChannel] usernameResponse status:`,
      //     usernameResponse.status,
      //     usernameResponse.ok
      //   );

      //   const usernameData = await usernameResponse.json();
      //   console.log(`[analyzeYouTubeChannel] usernameData:`, {
      //     items: usernameData.items,
      //     itemsLength: usernameData.items?.length,
      //     pageInfo: usernameData.pageInfo,
      //     error: usernameData.error,
      //     fullData: JSON.stringify(usernameData, null, 2),
      //   });

      //   if (
      //     !usernameResponse.ok ||
      //     !usernameData.items ||
      //     usernameData.items.length === 0
      //   ) {
      //     console.error(`[analyzeYouTubeChannel] forUsername도 실패`);
      //     return {
      //       success: false,
      //       error:
      //         "채널을 찾을 수 없습니다. 채널 ID 또는 사용자명을 확인해주세요.",
      //       debug: {
      //         forHandleResponse: channelData,
      //         forUsernameResponse: usernameData,
      //       },
      //     };
      //   }
      //   channelInfo = usernameData.items[0];
      // }
    } else {
      // 채널 ID로 직접 조회
      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${channelId}&key=${apiKey}`
      );

      if (!channelResponse.ok) {
        const errorData = await channelResponse.json();
        console.error(`[analyzeYouTubeChannel] 채널 조회 실패:`, errorData);
        return {
          success: false,
          error: "채널을 찾을 수 없습니다.",
        };
      }

      const channelData = await channelResponse.json();
      if (!channelData.items || channelData.items.length === 0) {
        return {
          success: false,
          error: "채널을 찾을 수 없습니다.",
        };
      }
      channelInfo = channelData.items[0];
    }

    const finalChannelId = channelInfo.id;
    const uploadsPlaylistId =
      channelInfo.contentDetails?.relatedPlaylists?.uploads;

    console.log(`[analyzeYouTubeChannel] 채널 정보:`, {
      channelId: finalChannelId,
      title: channelInfo.snippet?.title,
      uploadsPlaylistId,
    });

    if (!uploadsPlaylistId) {
      return {
        success: false,
        error: "업로드된 영상 목록을 가져올 수 없습니다.",
      };
    }

    // 3. 업로드된 영상 목록 가져오기 (최대 50개)
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}`
    );

    if (!videosResponse.ok) {
      const errorData = await videosResponse.json();
      console.error(`[analyzeYouTubeChannel] 영상 목록 조회 실패:`, errorData);
      return {
        success: false,
        error: "영상 목록을 가져올 수 없습니다.",
      };
    }

    const videosData = await videosResponse.json();
    const videoItems = videosData.items || [];

    console.log(`[analyzeYouTubeChannel] 영상 개수:`, videoItems.length);

    if (videoItems.length === 0) {
      return {
        success: true,
        channel: {
          id: finalChannelId,
          title: channelInfo.snippet?.title,
          description: channelInfo.snippet?.description,
          thumbnail: channelInfo.snippet?.thumbnails?.high?.url,
          subscriberCount: channelInfo.statistics?.subscriberCount,
          videoCount: channelInfo.statistics?.videoCount,
          viewCount: channelInfo.statistics?.viewCount,
        },
        videos: [],
      };
    }

    // 4. 영상 ID 목록 추출
    const videoIds = videoItems
      .map((item: any) => item.contentDetails?.videoId)
      .filter((id: string) => id);

    console.log(`[analyzeYouTubeChannel] 영상 ID 목록:`, videoIds.length);

    // 5. 영상 상세 정보 가져오기 (조회수, 좋아요, 댓글수 등)
    const videoDetailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(",")}&key=${apiKey}`
    );

    if (!videoDetailsResponse.ok) {
      const errorData = await videoDetailsResponse.json();
      console.error(
        `[analyzeYouTubeChannel] 영상 상세 정보 조회 실패:`,
        errorData
      );
      return {
        success: false,
        error: "영상 상세 정보를 가져올 수 없습니다.",
      };
    }

    const videoDetailsData = await videoDetailsResponse.json();
    const videoDetails = videoDetailsData.items || [];

    console.log(
      `[analyzeYouTubeChannel] 영상 상세 정보 개수:`,
      videoDetails.length
    );

    // 6. 데이터 매핑
    const videos = videoDetails.map((video: any) => {
      const statistics = video.statistics || {};
      // likeCount 필드가 존재하는지 확인 (숨겨진 경우 필드 자체가 없음)
      const hasLikeCount = "likeCount" in statistics;
      const likeCount = hasLikeCount
        ? parseInt(statistics.likeCount || "0", 10)
        : null; // null은 숨겨진 것을 의미

      return {
        id: video.id,
        title: video.snippet?.title,
        description: video.snippet?.description,
        thumbnail:
          video.snippet?.thumbnails?.high?.url ||
          video.snippet?.thumbnails?.medium?.url,
        publishedAt: video.snippet?.publishedAt,
        viewCount: parseInt(statistics.viewCount || "0", 10),
        likeCount: likeCount, // null이면 숨겨진 것, 숫자면 실제 좋아요 수
        isLikeCountHidden: !hasLikeCount, // 좋아요 수가 숨겨졌는지 여부
        commentCount: parseInt(statistics.commentCount || "0", 10),
        duration: video.contentDetails?.duration,
        channelTitle: video.snippet?.channelTitle,
      };
    });

    console.log(`[analyzeYouTubeChannel] 분석 완료:`, {
      channelId: finalChannelId,
      videoCount: videos.length,
    });

    return {
      success: true,
      channel: {
        id: finalChannelId,
        title: channelInfo.snippet?.title,
        description: channelInfo.snippet?.description,
        thumbnail: channelInfo.snippet?.thumbnails?.high?.url,
        subscriberCount: channelInfo.statistics?.subscriberCount,
        videoCount: channelInfo.statistics?.videoCount,
        viewCount: channelInfo.statistics?.viewCount,
      },
      videos,
    };
  } catch (error: any) {
    console.error("[analyzeYouTubeChannel] 전체 오류:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      error: error,
    });

    return {
      success: false,
      error: error?.message || "채널 분석 중 오류가 발생했습니다.",
    };
  }
}
