import type { FC } from "hono/jsx/dom";
import { css, keyframes } from "hono/css";
import { alpha, color } from "../../../styles/tokens.ts";

interface TabSkeletonProps {
  readonly variant: "dashboard" | "table" | "grid";
}

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
`;

const skeletonLine = css`
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    ${alpha(color.textPrimary, 0.06)} 0%,
    ${alpha(color.textPrimary, 0.12)} 50%,
    ${alpha(color.textPrimary, 0.06)} 100%
  );
  background-size: 400px 100%;
  animation: ${shimmer} 1.5s linear infinite;
`;

const statsGridStyle = css`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;
  @media (min-width: 600px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const statCardSkeleton = css`
  ${skeletonLine};
  height: 100px;
  border-radius: 12px;
`;

const rowSkeleton = css`
  ${skeletonLine};
  height: 48px;
  margin-bottom: 8px;
  border-radius: 8px;
`;

const searchSkeleton = css`
  ${skeletonLine};
  height: 40px;
  max-width: 400px;
  margin-bottom: 24px;
`;

const gridStyle = css`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  @media (min-width: 600px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
`;

const gridCardSkeleton = css`
  ${skeletonLine};
  height: 72px;
  border-radius: 12px;
`;

const DashboardSkeleton: FC = () => (
  <>
    <div class={statsGridStyle}>
      <div class={statCardSkeleton} />
      <div class={statCardSkeleton} />
      <div class={statCardSkeleton} />
      <div class={statCardSkeleton} />
    </div>
    <div class={rowSkeleton} />
    <div class={rowSkeleton} />
    <div class={rowSkeleton} />
  </>
);

const TableSkeleton: FC = () => (
  <>
    <div class={searchSkeleton} />
    <div class={rowSkeleton} />
    <div class={rowSkeleton} />
    <div class={rowSkeleton} />
    <div class={rowSkeleton} />
  </>
);

const GridSkeleton: FC = () => (
  <div class={gridStyle}>
    <div class={gridCardSkeleton} />
    <div class={gridCardSkeleton} />
    <div class={gridCardSkeleton} />
    <div class={gridCardSkeleton} />
    <div class={gridCardSkeleton} />
    <div class={gridCardSkeleton} />
  </div>
);

export const TabSkeleton: FC<TabSkeletonProps> = ({ variant }) => (
  <div role="status" aria-label="Carregando dados...">
    {variant === "dashboard" && <DashboardSkeleton />}
    {variant === "table" && <TableSkeleton />}
    {variant === "grid" && <GridSkeleton />}
  </div>
);
