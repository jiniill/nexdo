interface TreeConnectorProps {
  depth: number;
  isLast: boolean;
  hasParent: boolean;
}

export function TreeConnector({ depth, isLast, hasParent }: TreeConnectorProps) {
  if (depth === 0 || !hasParent) return null;

  return (
    <>
      {/* 수직선 (형제가 아래에 있을 때) */}
      {!isLast && (
        <div
          className="absolute border-l-2 border-slate-200"
          style={{
            left: `${(depth - 1) * 32 + 34}px`,
            top: 0,
            bottom: 0,
          }}
        />
      )}
      {/* L자 연결선 */}
      <div
        className="absolute border-l-2 border-b-2 border-slate-200 rounded-bl-lg"
        style={{
          left: `${(depth - 1) * 32 + 34}px`,
          top: 0,
          height: '50%',
          width: '12px',
        }}
      />
    </>
  );
}
