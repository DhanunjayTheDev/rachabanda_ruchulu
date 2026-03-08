
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
}

const StatCard = ({ label, value, icon, trend }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">{label}</p>
          <p className="text-3xl font-bold text-primary-gold">{value}</p>
          {trend && <p className="text-green-400 text-sm mt-2">{trend}</p>}
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </motion.div>
  );
};

export default StatCard;
