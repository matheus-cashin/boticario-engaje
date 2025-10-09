import { motion } from "framer-motion";
import { Brain } from "lucide-react";

interface UploadProgressBarProps {
  progress: number;
}

export function UploadProgressBar({ progress }: UploadProgressBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Brain className="h-6 w-6 text-primary" />
        </motion.div>
        <p className="text-sm font-medium">Processando com IA...</p>
      </div>
      
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-purple-500 to-primary bg-[length:200%_100%]"
          initial={{ width: "0%", backgroundPosition: "0% 0%" }}
          animate={{ 
            width: `${progress}%`,
            backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"]
          }}
          transition={{ 
            width: { duration: 0.5 },
            backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" }
          }}
        />
      </div>
      
      <p className="text-center text-xs text-muted-foreground">
        {progress}% concluído
      </p>
    </div>
  );
}