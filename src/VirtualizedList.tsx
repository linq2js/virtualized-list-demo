import {
  CSSProperties,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T) => any;
  threshold?: number;
  className?: string;
  style?: CSSProperties;
}

function handleViewportChanged(
  element: HTMLElement,
  callback: (height: number, width: number) => void
) {
  let prevWidth = -1;
  let prevHeight = -1;

  function handleChange() {
    const { width, height } = element.getBoundingClientRect();
    // if element size is actual changed
    if (width !== prevWidth || height !== prevHeight) {
      prevWidth = width;
      prevHeight = height;
      callback(height, width);
    }
  }

  handleChange();

  // using ResizeObserver if it is supported
  if ((window as any).ResizeObserver) {
    const observer = new (window as any).ResizeObserver(handleChange);
    observer.observe(element);
    return () => observer.disconnect();
  }

  // using setInterval for alternative solution
  const interval = setInterval(handleChange, 300);
  return () => clearInterval(interval);
}

function VirtualizedList<T>(props: VirtualizedListProps<T>) {
  const {
    items,
    itemHeight,
    className,
    renderItem,
    threshold = 0,
    style,
  } = props;
  const outerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewHeight, setViewHeight] = useState(0);
  const handleScroll = useCallback(() => {
    if (outerRef.current) {
      setScrollTop(outerRef.current.scrollTop);
    }
  }, [setScrollTop]);
  // calculate visible items
  const top = Math.max(0, scrollTop - threshold);
  const bottom = top + viewHeight + threshold * 2;
  const start = Math.floor(top / itemHeight);
  const end = Math.ceil(bottom / itemHeight);
  const visibleItems = useMemo(() => {
    return items.slice(start, end + 1).map((item, index) => ({
      // keep actual index
      index: index + start,
      value: item,
    }));
  }, [items, start, end]);

  useEffect(() => {
    if (outerRef.current) {
      return handleViewportChanged(outerRef.current, setViewHeight);
    }
  }, []);

  return (
    <div
      onScroll={handleScroll}
      ref={outerRef}
      className={className}
      style={{
        ...style,
        overflow: "auto",
        position: "relative",
      }}
    >
      <div
        style={{
          height: items.length * itemHeight,
        }}
      />
      <div
        style={{
          top: Math.max(scrollTop - threshold, 0),
          position: "absolute",
          left: 0,
          right: 0,
        }}
      >
        {visibleItems.map((item) => (
          <Fragment key={item.index}>{renderItem(item.value)}</Fragment>
        ))}
      </div>
    </div>
  );
}

export default VirtualizedList;
