export interface CreatureOption {
  id: string;
  label: string;
  silly?: boolean;
}

export const CREATURES: CreatureOption[] = [
  { id: "bunny", label: "Bunny" },
  { id: "deer", label: "Deer" },
  { id: "squirrel", label: "Squirrel" },
  { id: "bird", label: "Bird" },
  { id: "cat", label: "Cat" },
  { id: "dog", label: "Dog" },
  { id: "groundhog", label: "Groundhog" },
  { id: "fox", label: "Fox" },
  { id: "chipmunk", label: "Chipmunk" },
  { id: "raccoon", label: "Raccoon" },
  { id: "turkey", label: "Turkey" },
  { id: "owl", label: "Owl" },
  { id: "bigfoot", label: "Bigfoot", silly: true },
  { id: "unicorn", label: "Unicorn", silly: true },
  { id: "mystery_floof", label: "Mystery floof", silly: true },
  { id: "dragon", label: "Dragon (probably)", silly: true },
  { id: "lochness", label: "Loch Ness visitor", silly: true },
  { id: "alien", label: "Little green friend", silly: true },
];

export function creatureLabel(id: string): string {
  return CREATURES.find((c) => c.id === id)?.label ?? id;
}
