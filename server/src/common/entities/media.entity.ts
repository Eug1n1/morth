export class MediaEntity {
    mediaId: string;

    isPrivate: boolean;

    title: string;

    User: {
        username: string;
    };

    Type: {
        name: string;
    };

    _count: {
        Views: number;
        Likes: number;
    };
}
