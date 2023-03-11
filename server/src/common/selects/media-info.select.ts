export const MediaInfoSelect = {
    select: {
        uuid: true,
        isPrivate: true,
        title: true,
        User: {
            select: {
                uuid: true,
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
        Tags: {
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
