import { Spin } from 'antd';

export default function RouteLoading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 300 }}>
      <Spin size="large" />
    </div>
  );
}
