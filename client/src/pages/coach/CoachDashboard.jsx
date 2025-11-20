import React, { useMemo } from "react";
import {
  users,
  meals,
  nutritionPlans,
  workouts,
  workoutSchedules,
  buildCoachDashboardData,
} from "../../assets/fakedb";

const statCardClasses =
  "rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur shadow-lg shadow-black/20";

const CoachDashboard = () => {
  const coach = users.find((person) => person.role === "coach");

  const dashboard = useMemo(() => {
    if (!coach) return null;
    return buildCoachDashboardData(coach._id, {
      users,
      meals,
      nutritionPlans,
      workouts,
      workoutSchedules,
    });
  }, [coach]);

  if (!coach || !dashboard) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-10 text-center">
          <p className="text-xl font-semibold">No coach profile found.</p>
          <p className="mt-2 text-sm text-slate-400">
            Please seed the fake database to preview the coaching hub.
          </p>
        </div>
      </main>
    );
  }

  const { clients } = dashboard;

  const stats = {
    activeClients: clients.length,
    workoutsProgrammed: clients.reduce(
      (total, client) => total + (client.workouts?.length || 0),
      0
    ),
    activeNutritionPlans: clients.reduce(
      (total, client) =>
        total +
        (client.nutritionPlans?.filter((plan) => plan.isActive)?.length || 0),
      0
    ),
    upcomingSessions: clients.reduce((total, client) => {
      const sessions = client.workoutSchedules?.flatMap((schedule) =>
        schedule.schedule?.filter((day) => !day.isCompleted) ?? []
      );
      return total + (sessions?.length || 0);
    }, 0),
  };

  const recentComments = meals
    .flatMap((meal) =>
      meal.coachComments?.map((item) => ({
        mealName: meal.name,
        comment: item.comment,
        when: new Date(item.createdAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        userId: meal.userId,
        coachId: item.coachId,
      })) ?? []
    )
    .filter((entry) => entry.coachId === coach._id)
    .slice(0, 4);

  const formatGoal = (goal) =>
    goal
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 md:px-8">
        <header className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
            Coach Command Hub
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Personalized AI Gym
              </p>
              <h1 className="mt-2 text-4xl font-semibold md:text-5xl">
                Coach {coach.firstName} {coach.lastName}
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-slate-400">
                {coach.coachProfile?.bio ||
                  "Aligned coaching view to manage plans, nutrition, and weekly sessions with clarity."}
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-gradient-to-r from-emerald-400/20 via-teal-400/10 to-cyan-400/20 px-6 py-4 text-sm text-slate-200">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                Focus Areas
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {coach.coachProfile?.specialization
                  ?.map((item) => formatGoal(item))
                  .join(" • ")}
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Active Clients" value={stats.activeClients} />
          <StatCard
            label="Workouts Programmed"
            value={stats.workoutsProgrammed}
          />
          <StatCard
            label="Active Nutrition Plans"
            value={stats.activeNutritionPlans}
          />
          <StatCard label="Upcoming Sessions" value={stats.upcomingSessions} />
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionHeader
              title="Active Clients"
              subtitle="Snapshot of training focus and next touchpoint"
            />
            <div className="space-y-4">
              {clients.map(({ clientId, client, workouts, workoutSchedules }) => {
                const nextSession = workoutSchedules?.[0]?.schedule?.find(
                  (day) => !day.isCompleted
                );
                const nextWorkout = workouts?.find(
                  (workout) => workout._id === nextSession?.workoutId
                );
                const macroSummary = client.profile?.goals
                  ?.map((goal) => formatGoal(goal))
                  .join(" • ");

                return (
                  <article
                    key={clientId}
                    className={`${statCardClasses} hover:border-emerald-400/30 transition`}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                          Client
                        </p>
                        <h3 className="text-2xl font-semibold text-white">
                          {client.firstName} {client.lastName}
                        </h3>
                        <p className="text-sm text-slate-400">{macroSummary}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-right">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                          Commitment
                        </p>
                        <p className="text-lg font-semibold text-white">
                          {client.profile?.workoutDaysPerWeek}x / week
                        </p>
                        <p className="text-xs text-slate-400">
                          {client.profile?.workoutSplit?.toUpperCase()} Split
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <div className="rounded-xl border border-white/5 bg-slate-900/60 p-4">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                          Next Session
                        </p>
                        {nextWorkout ? (
                          <>
                            <p className="mt-2 text-lg font-semibold text-white">
                              {nextWorkout.name}
                            </p>
                            <p className="text-sm text-slate-400">
                              {nextWorkout.description}
                            </p>
                          </>
                        ) : (
                          <p className="mt-2 text-sm text-slate-500">
                            No upcoming workout scheduled.
                          </p>
                        )}
                      </div>
                      <div className="rounded-xl border border-white/5 bg-slate-900/60 p-4">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                          Training Notes
                        </p>
                        <p className="mt-2 text-sm text-slate-300">
                          {nextWorkout?.notes ||
                            "Keep consistency high, focus on progressive overload and adherence."}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                          {nextWorkout?.exercises?.slice(0, 3).map((exercise) => (
                            <span
                              key={exercise.name}
                              className="rounded-full border border-white/10 px-3 py-1"
                            >
                              {exercise.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="space-y-6">
            <div className={statCardClasses}>
              <SectionHeader
                title="Weekly Priorities"
                subtitle="High-level focus for this sprint"
              />
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                  Align Alice’s push day with lighter warm-up sets.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                  Reconfirm Bob’s macro targets post business trip.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-fuchsia-400" />
                  Log compliance notes nightly to feed AI regeneration.
                </li>
              </ul>
            </div>

            <div className={statCardClasses}>
              <SectionHeader
                title="Latest Feedback"
                subtitle="Recent meal or workout comments"
              />
              <div className="mt-4 space-y-4">
                {recentComments.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No comments logged yet. Keep sharing timely notes.
                  </p>
                )}
                {recentComments.map((entry) => {
                  const client = users.find((person) => person._id === entry.userId);
                  return (
                    <div
                      key={`${entry.mealName}-${entry.when}`}
                      className="rounded-xl border border-white/5 bg-slate-900/60 p-4"
                    >
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        {entry.when}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {client?.firstName} • {entry.mealName}
                      </p>
                      <p className="mt-1 text-sm text-slate-300">
                        “{entry.comment}”
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
};

const StatCard = ({ label, value }) => (
  <div className={`${statCardClasses} flex flex-col gap-3`}>
    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
    <p className="text-4xl font-semibold text-white">{value}</p>
  </div>
);

const SectionHeader = ({ title, subtitle }) => (
  <div>
    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
      {subtitle}
    </p>
    <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
  </div>
);

export default CoachDashboard;

