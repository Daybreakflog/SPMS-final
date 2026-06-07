import { Skeleton } from 'antd';

interface ChartSkeletonProps {
  height?: number;
}

export default function ChartSkeleton({ height = 300 }: ChartSkeletonProps) {
  return (
    <div style={{ height }} className="flex flex-col items-center justify-center gap-4 px-6">
      <Skeleton.Input active block style={{ height: 20 }} />
      <Skeleton active paragraph={{ rows: 5 }} title={false} />
    </div>
  );
}
