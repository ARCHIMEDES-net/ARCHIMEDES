import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

export default function SectionEyebrow({ children, className = "" }) {
  return <Badge className={cn("mb-4", className)}>{children}</Badge>;
}
