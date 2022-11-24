export interface NpmPackageResponse {
  name: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  "dist-tags": { latest: string; next: string };
  versions: Record<string, any>;
}
