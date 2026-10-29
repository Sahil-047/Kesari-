import { MediaModel } from "../models/index.js";
import type { Media } from "../schemas/media.schema.js";
import { BaseRepository } from "./base.repository.js";

class MediaRepository extends BaseRepository<Media> {
  constructor() {
    super(MediaModel);
  }
}

export const mediaRepository = new MediaRepository();
