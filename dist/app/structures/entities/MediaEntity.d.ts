import { Entity, EntityData } from "../Entity";
export interface MediaEntityData extends EntityData {
    url: string;
    hash: string;
}
export interface MediaEntity extends Entity<MediaEntityData> {
}
