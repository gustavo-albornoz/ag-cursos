import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const ALLOWED_FOLDERS = ['cursos', 'avatars'];

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const folder = ALLOWED_FOLDERS.includes(searchParams.get('folder') ?? '') ? searchParams.get('folder')! : 'cursos';

  const data = await request.formData();
  const file = data.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  const dir = join(process.cwd(), 'public', folder);

  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), buffer);
  return NextResponse.json({ url: `/${folder}/${filename}` });
}
