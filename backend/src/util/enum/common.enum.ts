/** Draft/published lifecycle shared by crafts, collections and The Edit. */
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

export enum OverlayAlignEnum {
  LEFT = "left",
  RIGHT = "right",
}
