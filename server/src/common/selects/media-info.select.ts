export const MediaInfoSelect = {
    select: {
        uuid: true,
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
        Thumb: {
            select: {
                thumbPath: true,
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
