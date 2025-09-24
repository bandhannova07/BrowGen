type Props = {
  title: string;
  description?: string;
  level?: string;
  moduleCount?: number;
};

export function CourseCard({ title, description, level, moduleCount }: Props) {
  return (
    <div className="border rounded p-4 hover:shadow-sm transition">
      <h3 className="font-semibold text-lg">{title}</h3>
      {level && <span className="text-xs px-2 py-0.5 rounded bg-gray-100">{level}</span>}
      <p className="text-sm text-gray-600 mt-2 line-clamp-3">{description}</p>
      {typeof moduleCount !== 'undefined' && (
        <p className="text-xs mt-3 text-gray-500">{moduleCount} modules</p>
      )}
    </div>
  );
}
