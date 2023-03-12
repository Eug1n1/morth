export const MediaInfoSelect = {
    select: {
        cuid: true,
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
                imagePath: true,
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
