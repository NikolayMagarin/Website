export interface GetTileResultSuccess {
  image: ArrayBuffer;
  error: null;
  success: true;
}

export interface GetTileResultFail {
  image: null;
  error: any;
  success: false;
}

export type GetTileResult = GetTileResultSuccess | GetTileResultFail;

export async function getTile(
  tileX: number,
  tileY: number,
  zoom: number = 11
): Promise<GetTileResult> {
  try {
    const response = await fetch(
      `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`,
      {
        headers: {
          'User-Agent': 'kaskogart/1.0.0 (Linux) node-fetch',
        },
      }
    );
    const image = await response.arrayBuffer();

    return {
      image,
      error: null,
      success: true,
    };
  } catch (error) {
    return { error, image: null, success: false };
  }
}
