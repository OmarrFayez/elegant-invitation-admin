import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { SortDirection } from "@/hooks/useTableData";

interface SortableHeaderProps {
  children: React.ReactNode;
  field: string;
  currentSortField: string | null;
  sortDirection: SortDirection;
  onSort: (field: string) => void;
  className?: string;
}

const SortableHeader = ({ 
  children, 
  field, 
  currentSortField, 
  sortDirection, 
  onSort,
  className = ""
}: SortableHeaderProps) => {
  const isActive = currentSortField === field;
  
  const getSortIcon = () => {
    if (!isActive) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    if (sortDirection === 'asc') return <ArrowUp className="ml-2 h-4 w-4" />;
    if (sortDirection === 'desc') return <ArrowDown className="ml-2 h-4 w-4" />;
    return <ArrowUpDown className="ml-2 h-4 w-4" />;
  };

  return (
    <Button
      variant="ghost"
      onClick={() => onSort(field)}
      className={`h-auto p-0 font-medium hover:bg-transparent ${className}`}
    >
      {children}
      {getSortIcon()}
    </Button>
  );
};

export default SortableHeader;