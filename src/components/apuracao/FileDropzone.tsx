import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileSpreadsheet, Upload, CheckCircle, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface FileDropzoneProps {
  onFileAccepted: (file: File) => void;
  maxSize?: number;
  disabled?: boolean;
}

type DropzoneState = "default" | "hover" | "dragover" | "uploading" | "success" | "error";

export function FileDropzone({ onFileAccepted, maxSize = 10 * 1024 * 1024, disabled = false }: FileDropzoneProps) {
  const [state, setState] = useState<DropzoneState>("default");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === "file-too-large") {
        setErrorMessage("Arquivo muito grande. Tamanho máximo: 10MB");
      } else if (rejection.errors[0]?.code === "file-invalid-type") {
        setErrorMessage("Tipo de arquivo inválido. Use .xlsx, .xls ou .csv");
      } else {
        setErrorMessage("Erro ao processar arquivo");
      }
      setState("error");
      setTimeout(() => {
        setState("default");
        setErrorMessage("");
      }, 3000);
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setState("uploading");
      setProgress(0);

      // Simular upload com progresso
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setState("success");
            setTimeout(() => {
              onFileAccepted(file);
            }, 500);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxSize,
    multiple: false,
    disabled,
    onDragEnter: () => !disabled && setState("dragover"),
    onDragLeave: () => setState(isDragActive ? "dragover" : "default"),
  });

  const getStateStyles = () => {
    switch (state) {
      case "dragover":
        return "border-blue-500 bg-blue-50 scale-[1.02]";
      case "uploading":
        return "border-blue-400 bg-blue-50";
      case "success":
        return "border-green-500 bg-green-50";
      case "error":
        return "border-red-500 bg-red-50";
      case "hover":
        return "border-blue-300 bg-blue-50/50";
      default:
        return "border-gray-300 bg-white";
    }
  };

  const renderIcon = () => {
    if (state === "success") {
      return <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />;
    }
    if (state === "error") {
      return <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />;
    }
    if (state === "uploading") {
      return <FileSpreadsheet className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-pulse" />;
    }
    return <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />;
  };

  const renderContent = () => {
    if (state === "uploading") {
      return (
        <>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Enviando arquivo...
          </h3>
          <div className="w-full max-w-md mx-auto mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-600 text-center mt-2">{progress}%</p>
          </div>
        </>
      );
    }

    if (state === "success") {
      return (
        <h3 className="text-xl font-semibold text-green-600">
          Upload concluído!
        </h3>
      );
    }

    if (state === "error") {
      return (
        <>
          <h3 className="text-xl font-semibold text-red-600 mb-2">
            Erro no upload
          </h3>
          <p className="text-sm text-red-700">{errorMessage}</p>
        </>
      );
    }

    return (
      <>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {isDragActive ? "Solte o arquivo aqui" : "Arraste seu arquivo aqui ou clique para selecionar"}
        </h3>
        <p className="text-sm text-gray-600">
          Formatos: .xlsx, .xls, .csv | Tamanho máx: 10MB
        </p>
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${getStateStyles()}
          ${state === "uploading" || state === "success" || disabled ? "pointer-events-none opacity-50" : ""}
        `}
        onMouseEnter={() => !disabled && state === "default" && setState("hover")}
        onMouseLeave={() => state === "hover" && setState("default")}
      >
        <input {...getInputProps()} />
        {renderIcon()}
        {renderContent()}
      </div>
    </motion.div>
  );
}
