import { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Input, List, Tag, Empty, Spin } from 'antd';
import {
  SearchOutlined,
  FileTextOutlined,
  UserOutlined,
  DollarOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { menuConfig, type MenuItemConfig } from '@/router/routes.config';
import { renterService } from '@/services/renter.service';
import { contractService } from '@/services/contract.service';
import { billingService } from '@/services/billing.service';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: 'menu' | 'renter' | 'contract' | 'bill';
  icon: React.ReactNode;
  path: string;
}

const categoryColors: Record<string, string> = {
  menu: 'blue',
  renter: 'green',
  contract: 'purple',
  bill: 'gold',
};

function flattenMenu(items: MenuItemConfig[], parentLabel = ''): SearchResult[] {
  const results: SearchResult[] = [];
  for (const item of items) {
    const label = parentLabel ? `${parentLabel} / ${item.label}` : item.label;
    if (item.path) {
      results.push({
        id: `menu-${item.key}`,
        title: label,
        category: 'menu',
        icon: <AppstoreOutlined />,
        path: item.path,
      });
    }
    if (item.children) {
      results.push(...flattenMenu(item.children, label));
    }
  }
  return results;
}

const allMenuItems = flattenMenu(menuConfig);

export default function GlobalSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const menuResults = allMenuItems.filter(
        (m) => m.title.toLowerCase().includes(q.toLowerCase()),
      );

      const [renters, contracts, bills] = await Promise.allSettled([
        renterService.list({ keyword: q, page: 1, pageSize: 5 }),
        contractService.list({ keyword: q, page: 1, pageSize: 5 }),
        billingService.billList({ keyword: q, page: 1, pageSize: 5 }),
      ]);

      const renterResults: SearchResult[] =
        renters.status === 'fulfilled'
          ? ((renters.value as { items: Array<{ id: string; name: string; phone: string }> }).items ?? []).map((r) => ({
              id: `renter-${r.id}`,
              title: r.name,
              description: r.phone,
              category: 'renter' as const,
              icon: <UserOutlined />,
              path: `/customers/renters/${r.id}`,
            }))
          : [];

      const contractResults: SearchResult[] =
        contracts.status === 'fulfilled'
          ? ((contracts.value as { items: Array<{ id: string; contractNo: string; renterName: string }> }).items ?? []).map((c) => ({
              id: `contract-${c.id}`,
              title: c.contractNo,
              description: c.renterName,
              category: 'contract' as const,
              icon: <FileTextOutlined />,
              path: `/contracts/${c.id}`,
            }))
          : [];

      const billResults: SearchResult[] =
        bills.status === 'fulfilled'
          ? ((bills.value as { items: Array<{ id: string; billNo: string; renterName: string }> }).items ?? []).map((b) => ({
              id: `bill-${b.id}`,
              title: b.billNo,
              description: b.renterName,
              category: 'bill' as const,
              icon: <DollarOutlined />,
              path: `/billing/bills/${b.id}`,
            }))
          : [];

      setResults([...menuResults, ...renterResults, ...contractResults, ...billResults]);
      setActiveIndex(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setKeyword(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(value), 300);
  };

  const handleSelect = (item: SearchResult) => {
    setOpen(false);
    setKeyword('');
    setResults([]);
    navigate(item.path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    }
  };

  const categoryLabel: Record<string, string> = {
    menu: t('globalSearch.categoryMenu'),
    renter: t('globalSearch.categoryRenter'),
    contract: t('globalSearch.categoryContract'),
    bill: t('globalSearch.categoryBill'),
  };

  return (
    <Modal
      open={open}
      onCancel={() => { setOpen(false); setKeyword(''); setResults([]); }}
      footer={null}
      closable={false}
      width={560}
      styles={{ body: { padding: 0 } }}
      afterOpenChange={(visible) => {
        if (visible) setTimeout(() => inputRef.current?.focus(), 50);
      }}
    >
      <div className="p-3">
        <Input
          ref={inputRef as never}
          prefix={<SearchOutlined />}
          placeholder={t('globalSearch.placeholder')}
          value={keyword}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          allowClear
          size="large"
          autoFocus
        />
      </div>
      <div className="max-h-[400px] overflow-auto border-t border-border">
        {loading ? (
          <div className="flex justify-center py-8"><Spin /></div>
        ) : results.length === 0 ? (
          keyword ? <Empty description={t('common.noData')} className="py-8" /> : (
            <div className="py-8 text-center text-text-tertiary text-sm">{t('globalSearch.hint')}</div>
          )
        ) : (
          <List
            dataSource={results}
            renderItem={(item, index) => (
              <List.Item
                className={`cursor-pointer px-4 transition-colors hover:bg-fill-quaternary ${index === activeIndex ? 'bg-fill-quaternary' : ''}`}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <List.Item.Meta
                  avatar={<span className="text-lg">{item.icon}</span>}
                  title={item.title}
                  description={item.description}
                />
                <Tag color={categoryColors[item.category]}>{categoryLabel[item.category]}</Tag>
              </List.Item>
            )}
          />
        )}
      </div>
      <div className="border-t border-border px-4 py-2 text-xs text-text-tertiary flex gap-4">
        <span>↑↓ {t('globalSearch.navigate')}</span>
        <span>↵ {t('globalSearch.select')}</span>
        <span>Esc {t('globalSearch.close')}</span>
      </div>
    </Modal>
  );
}
