import type { MediaEntity } from "./entities/MediaEntity";
import type { MentionEntity } from "./entities/MentionEntity";
import type { UrlEntity } from "./entities/UrlEntity";
export declare enum EntityType {
    Media = 0,
    Mention = 1,
    URL = 2
}
export interface EntitiesBody {
    media?: MediaEntity[];
    mentions?: MentionEntity[];
    urls?: UrlEntity[];
}
export interface EntityData {
    indices?: [number, number];
}
export interface Entity<T extends EntityData> {
    id: string;
    type: EntityType;
    data: T;
}
