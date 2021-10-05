import { useCallback, useEffect, useState } from "react";
import "./App.css";
import VirtualizedList from "./VirtualizedList";

interface DataItem {
  text: string;
  image: string;
}

function createList(size: number): DataItem[] {
  return new Array(size).fill(null).map((_, index) => ({
    image: `https://picsum.photos/seed/${index}/50`,
    text: `Item ${index}`,
  }));
}

const DEFAULT_ITEMS = createList(10000);

function Item({ text, image, height }: DataItem & { height: number }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // simulate loading effect
    const timeout = setTimeout(setLoading, 200, false);
    return () => clearTimeout(timeout);
  }, [setLoading]);

  return (
    <div style={{ height: height, display: "flex", alignItems: "center" }}>
      <link rel="preload" as="image" href={image} />
      <img src={image} alt={text} width={height} style={{ marginRight: 10 }} />
      {loading ? "Loading..." : text}
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [threshold, setThreshold] = useState(2000);
  const [itemHeight, setItemHeight] = useState(100);
  const renderItem = useCallback(
    (item: DataItem) => <Item {...item} height={itemHeight} />,
    [itemHeight]
  );

  return (
    <div className="App">
      <h1>Virtualized List Demo</h1>
      <p>
        Threshold: {threshold}, items: {items.length}, item height: {itemHeight}
      </p>
      <p>
        <button onClick={() => setItems(createList(10))}>10 items</button>
        <button onClick={() => setItems(createList(1000))}>1000 items</button>
        <button onClick={() => setItems(createList(5000))}>5000 items</button>
        <button onClick={() => setItemHeight(100)}>100px item height</button>
        <button onClick={() => setItemHeight(200)}>200px item height</button>
        <button onClick={() => setThreshold(0)}>No threshold</button>
        <button onClick={() => setThreshold(2000)}>2000 threshold</button>
      </p>
      <VirtualizedList
        items={items}
        itemHeight={itemHeight}
        renderItem={renderItem}
        threshold={threshold}
        style={{ border: "1px solid silver", height: 500 }}
      />
    </div>
  );
}
