import { Search } from 'lucide-react';
import { Input } from '../../ui';

export function SearchBar() {
  return (
    <Input
      type="text"
      placeholder="Search or Type command..."
      icon={<Search className="w-4 h-4" />}
      shortcut="⌘K"
      className="w-64"
    />
  );
}
