import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { SoftTag } from '@/components/ui';

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: article } = await supabase.from('articles').select('*').eq('slug', slug).eq('is_published', true).single();
  if (!article) notFound();

  return (
    <main className="container-page py-10">
      <article className="card mx-auto max-w-3xl">
        <SoftTag tone="blue">{article.category}</SoftTag>
        <h1 className="mt-5 text-4xl font-black text-cocoa">{article.title}</h1>
        <div className="mt-8 whitespace-pre-line text-base leading-8 text-cocoa/70">{article.content}</div>
      </article>
    </main>
  );
}
