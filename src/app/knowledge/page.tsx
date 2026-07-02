import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { SoftTag } from '@/components/ui';

export default async function KnowledgePage() {
  const supabase = await createSupabaseServerClient();
  const { data: articles } = await supabase.from('articles').select('*').eq('is_published', true).order('created_at', { ascending: false });

  return (
    <main className="container-page py-10">
      <div className="badge mb-4">База знаний</div>
      <h1 className="section-title">Короткие материалы по поведению и уходу</h1>
      <p className="section-subtitle">Контент нужен для пользы, удержания и органического трафика. В MVP статьи добавляет администратор.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles?.map((article) => (
          <Link href={`/knowledge/${article.slug}`} className="card transition hover:-translate-y-1" key={article.id}>
            <SoftTag tone="blue">{article.category}</SoftTag>
            <h2 className="mt-4 text-xl font-black text-cocoa">{article.title}</h2>
            <p className="mt-3 line-clamp-4 text-sm leading-6 text-cocoa/60">{article.excerpt}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
