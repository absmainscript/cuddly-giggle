
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { Settings, Clock, Heart } from "lucide-react";

export function MaintenancePage() {
  const { data: maintenanceData } = useQuery({
    queryKey: ["/api/maintenance-check"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/maintenance-check");
      return response.json();
    },
  });

  const maintenanceInfo = maintenanceData?.maintenance || {};
  const generalInfo = maintenanceData?.general || {};

  const title = maintenanceInfo.title || "Site em Manutenção";
  const message = maintenanceInfo.message || "Estamos fazendo algumas melhorias. Voltaremos em breve!";
  const doctorName = generalInfo.name || "Dra. Adrielle Benhossi";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center"
      >
        {/* Ícone animado */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 mx-auto mb-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
        >
          <Settings className="w-10 h-10 text-white" />
        </motion.div>

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-gray-900 mb-4"
        >
          {title}
        </motion.h1>

        {/* Nome da psicóloga */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg font-medium text-purple-700 mb-6"
        >
          {doctorName}
        </motion.p>

        {/* Mensagem */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>
        </motion.div>

        {/* Ícones decorativos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center space-x-4 text-purple-400"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Clock className="w-6 h-6" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            <Heart className="w-6 h-6" />
          </motion.div>
        </motion.div>

        {/* Footer discreto */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-xs text-gray-400"
        >
          Obrigada pela paciência ♥
        </motion.p>
      </motion.div>
    </div>
  );
}
