import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useInView } from '@/hooks/useInView';
import { useApp } from '@/context/AppContext';

const COLORS = [
  'hsl(185, 100%, 50%)',  // cyan
  'hsl(210, 100%, 55%)',  // blue
  'hsl(270, 100%, 65%)',  // purple
  'hsl(160, 85%, 45%)',   // green
  'hsl(45, 100%, 55%)',   // yellow
];

type CategorySlice = {
  category: string;
  returns: number;
  percentage: number;
};

export function CategoryChart() {
  const [ref, isInView] = useInView<HTMLDivElement>();
  const { rootCauses } = useApp();

  /* =========================
     DERIVE CATEGORY COUNTS
  ========================= */
  const safeRootCauses = Array.isArray(rootCauses) ? rootCauses : [];

  const categoryMap: Record<string, number> = {};

  safeRootCauses.forEach((cause) => {
    const category = cause.category || 'Other';
    categoryMap[category] = (categoryMap[category] || 0) + 1;
  });

  const total = Object.values(categoryMap).reduce((a, b) => a + b, 0);

  const categoryData: CategorySlice[] =
    total > 0
      ? Object.entries(categoryMap).map(([category, count]) => ({
          category,
          returns: count,
          percentage: Math.round((count / total) * 100),
        }))
      : [];

  /* =========================
     RENDER (UI UNCHANGED)
  ========================= */
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Returns by Category
        </h3>
        <p className="text-sm text-muted-foreground">
          Distribution of returns
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="returns"
                animationBegin={isInView ? 0 : undefined}
                animationDuration={1000}
              >
                {categoryData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(225, 30%, 12%)',
                  border: '1px solid hsl(225, 20%, 20%)',
                  borderRadius: '12px',
                }}
                labelStyle={{ color: 'hsl(210, 40%, 96%)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-3">
          {categoryData.map((item, index) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-muted-foreground flex-1">
                {item.category}
              </span>
              <span className="text-sm font-medium text-foreground">
                {item.percentage}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
