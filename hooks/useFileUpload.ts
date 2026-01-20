import { useState, useEffect, useRef, useCallback } from 'react';

export const useFileUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const fileUrlsRef = useRef<string[]>([]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      fileUrlsRef.current = [...fileUrlsRef.current, ...newUrls];
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    // Revoke the URL for the removed file
    if (fileUrlsRef.current[index]) {
      URL.revokeObjectURL(fileUrlsRef.current[index]);
    }
    fileUrlsRef.current = fileUrlsRef.current.filter((_, i) => i !== index);
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    // Revoke all URLs
    fileUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    fileUrlsRef.current = [];
    setFiles([]);
  }, []);

  // Cleanup all object URLs on component unmount
  useEffect(() => {
    return () => {
      fileUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  return {
    files,
    fileUrls: fileUrlsRef.current,
    handleFileChange,
    removeFile,
    clearFiles
  };
};
