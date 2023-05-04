import { Entity, EntityData } from "../Entity";

enum MediaEntityType {
    Image,
    Video,
}

export interface MediaEntityData extends EntityData {
    url: string;
    hash: string;
}

export interface MediaEntity extends Entity<MediaEntityData> {}