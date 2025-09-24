export default function AboutPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold">Our Mission</h1>
        <p className="mt-2 text-gray-700">To empower students and youth with practical skills, supportive community, and guided mentorship.</p>
      </section>
      <section>
        <h2 className="text-2xl font-semibold">Founders Story</h2>
        <p className="mt-2 text-gray-700">We started BrowGen to make learning collaborative and actionable, helping learners turn curiosity into capability.</p>
      </section>
      <section>
        <h2 className="text-2xl font-semibold">Impact & Goals</h2>
        <ul className="list-disc pl-6 mt-2 text-gray-700">
          <li>Reach 10,000 learners with practical projects.</li>
          <li>Facilitate 1,000+ mentor-led sessions.</li>
          <li>Improve career outcomes through community-driven challenges.</li>
        </ul>
      </section>
    </div>
  );
}
