import { useEffect, useRef, useState } from 'react';
import { Button, Card, Input } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { SendOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { repairService } from '@/services/repair.service';
import { useUserStore } from '@/store/user.store';
import { formatDateTime } from '@/utils/format';
interface RepairMessageListProps {
  repairId: string;
}

export default function RepairMessageList({ repairId }: RepairMessageListProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const currentUserId = useUserStore((s) => s.user?.id) ?? 'current-user';

  const { data: messages = [], refetch } = useQuery({
    queryKey: ['repair-messages', repairId],
    queryFn: () => repairService.getMessages(repairId),
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content) return;
    setSending(true);
    try {
      await repairService.sendMessage(repairId, { content });
      setInputValue('');
      refetch();
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card title={t('service.messageArea')} size="small">
      <div ref={listRef} className="mb-3 max-h-[400px] overflow-y-auto space-y-3">
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-lg px-3 py-2 ${isMine ? 'bg-blue-50 text-right' : 'bg-fill-quaternary'}`}>
                <div className="text-xs text-text-tertiary mb-1">
                  {msg.senderName} · {formatDateTime(msg.createdAt)}
                </div>
                <div className="text-sm">{msg.content}</div>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="text-center text-text-tertiary py-8">{t('common.noData')}</div>
        )}
      </div>
      <div className="flex gap-2">
        <Input.TextArea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('service.messagePlaceholder')}
          autoSize={{ minRows: 1, maxRows: 3 }}
          className="flex-1"
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={sending}
          disabled={!inputValue.trim()}
        >
          {t('service.send')}
        </Button>
      </div>
    </Card>
  );
}
