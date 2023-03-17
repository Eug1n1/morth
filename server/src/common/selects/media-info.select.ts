export const MediaInfoSelect = {
    select: {
        mediaId: true,
        isPrivate: true,
        title: true,
        User: {
            select: {
                username: true,
            },
        },
        Type: {
            select: {
                name: true,
            },
        },
        _count: {
            select: {
                Views: true,
                Likes: true,
            },
        },
    },
};
