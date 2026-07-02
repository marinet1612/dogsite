'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { SendHorizontal } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { sendMessageAction } from '@/lib/actions/chats';
import type { Message, Profile } from '@/lib/types';

export function ChatClient({
  conversationId,
  initialMessages,
  currentUserId,
  profiles
}: {
  conversationId: string;
  initialMessages: Message[];
  currentUserId: string;
  profiles: Profile[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState('');
  const [isPending, startTransition] = useTransition();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  const names = new Map(profiles.map((profile) => [profile.id, profile.full_name || profile.email || 'Участник']));

  function submit() {
    const value = body.trim();
    if (!value) return;
    const form = new FormData();
    form.set('conversation_id', conversationId);
    form.set('body', value);
    setBody('');
    startTransition(() => sendMessageAction(form));
  }

  return (
    <div className="card flex min-h-[620px] flex-col p-0">
      <div className="border-b border-cocoa/10 p-6">
        <div className="text-lg font-black text-cocoa">Чат</div>
        <p className="mt-1 text-sm text-cocoa/55">История рекомендаций, договорённостей и комментариев хранится в одном месте.</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.map((message) => {
          const own = message.sender_id === currentUserId;
          return (
            <div key={message.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] rounded-[1.5rem] px-5 py-3 shadow-sm ${own ? 'bg-cocoa text-white' : 'bg-white text-cocoa'}`}>
                <div className={`mb-1 text-xs font-bold ${own ? 'text-white/60' : 'text-cocoa/45'}`}>{names.get(message.sender_id)}</div>
                <div className="text-sm leading-6">{message.body}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-cocoa/10 p-4">
        <div className="flex gap-3">
          <input
            className="input"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submit();
            }}
            placeholder="Написать сообщение или сохранить рекомендацию..."
          />
          <button className="btn-primary" disabled={isPending} onClick={submit} type="button">
            <SendHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
