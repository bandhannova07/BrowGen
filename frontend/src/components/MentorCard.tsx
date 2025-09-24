type Props = {
  name: string;
  bio?: string;
  expertise?: string[];
};

export function MentorCard({ name, bio, expertise }: Props) {
  return (
    <div className="border rounded p-4">
      <h3 className="font-semibold text-lg">{name}</h3>
      <p className="text-sm text-gray-600 mt-1">{bio}</p>
      <div className="flex flex-wrap gap-2 mt-2 text-xs">
        {expertise?.map((e) => (
          <span key={e} className="px-2 py-0.5 rounded bg-gray-100">{e}</span>
        ))}
      </div>
    </div>
  );
}
