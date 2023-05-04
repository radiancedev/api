import { Entity, EntityData } from "../Entity";

export interface UrlEntityData extends EntityData {
    url: string;
}

export interface UrlEntity extends Entity<UrlEntityData> { }