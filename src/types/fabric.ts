/* eslint-disable @typescript-eslint/no-explicit-any */
// Simplified types to prevent build-time type resolution errors on the server.
export type FabricModule = any;
export type FabricObject = any;
export type FabricCanvas = any;
export type EditorMode =
  | "templates"
  | "elements"
  | "text"
  | "tools"
  | "advanced-settings";
