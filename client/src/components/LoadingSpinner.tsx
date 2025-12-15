export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
        <div className="absolute top-0 w-12 h-12 rounded-full border-4 border-transparent border-t-primary-500 animate-spin"></div>
      </div>
    </div>
  );
}
