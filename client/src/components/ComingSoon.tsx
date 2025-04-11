import { Card, CardContent } from "@/components/ui/card";
import { FaClock } from "react-icons/fa";

interface ComingSoonProps {
  title: string;
  description?: string;
}

const ComingSoon = ({ title, description }: ComingSoonProps) => {
  return (
    <Card className="bg-[#132743] border-none shadow-lg max-w-4xl mx-auto mt-8">
      <CardContent className="p-10">
        <div className="text-center">
          <FaClock className="text-5xl text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">
            {title} - <span className="text-primary">Prochainement</span>
          </h2>
          {description && (
            <p className="text-gray-300 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ComingSoon;