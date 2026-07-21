export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props?: {
    className?: string;
    text?: string;
    html?: string;
    attrs?: Record<string, string>;
    aria?: Record<string, string>;
    on?: Partial<Record<string, (e: Event) => void>>;
  },
  ...children: (Node | string | (Node | string)[])[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (props?.className) node.className = props.className;
  if (props?.text) node.textContent = props.text;
  if (props?.html) node.innerHTML = props.html;
  if (props?.attrs) {
    for (const [k, v] of Object.entries(props.attrs)) {
      node.setAttribute(k, v);
    }
  }
  if (props?.aria) {
    for (const [k, v] of Object.entries(props.aria)) {
      node.setAttribute(k, v);
    }
  }
  if (props?.on) {
    for (const [ev, fn] of Object.entries(props.on)) {
      if (fn) node.addEventListener(ev, fn);
    }
  }
  const flat = children.flat();
  for (const child of flat) {
    node.append(
      typeof child === "string" ? document.createTextNode(child) : child
    );
  }
  return node;
}

export function clear(node: HTMLElement): void {
  node.replaceChildren();
}
