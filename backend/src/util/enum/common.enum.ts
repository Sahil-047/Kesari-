/** Draft/published lifecycle for pages and other studio content. */
export enum PublishStatusEnum {
  DRAFT = "draft",
  PUBLISHED = "published",
}

/** Where a validated value is read from on the request. */
export enum PayloadType {
  BODY = "body",
  QUERY = "query",
  PARAMS = "params",
}
