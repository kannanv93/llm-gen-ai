'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LuLayoutDashboard,
  LuDatabase,
  LuPlug,
  LuActivity,
  LuClipboardCheck,
  LuFlaskConical,
  LuWorkflow,
  LuSettings,
} from 'react-icons/lu'; // Using Lucide icons

const navItems = [
  { name: 'Dashboard', href: '/', icon: LuLayoutDashboard },
  { name: 'Data Ingestion', href: '/data-ingestion', icon: LuDatabase },
  { name: 'Integrations', href: '/integrations', icon: LuPlug },
  { name: 'Monitoring', href: '/monitoring', icon: LuActivity },
  { name: 'Validation', href: '/model-validation', icon: LuClipboardCheck },
  { name: 'PromptEval Lab', href: '/prompt-eval-lab', icon: LuFlaskConical },
  { name: 'Use Case OrchestrateX', href: '/use-case-orchestratex', icon: LuWorkflow },
  { name: 'Settings', href: '/settings', icon: LuSettings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-gray-800 text-white p-4 fixed top-0 left-0 flex flex-col">
      <div className="mb-8 text-xl font-semibold px-2">
        Nimbus Uno
        <br />
        <span className="text-lg font-normal">GenAI Surakshit</span>
      </div>
      <nav className="flex-grow">
        <ul>
          {navItems.map((item) => {
            const Icon = item.icon; // Component for the icon
            return (
              <li key={item.name} className="mb-2">
                <Link href={item.href}>
                  <span // Wrapper span for styling
                    className={`flex items-center p-2 rounded hover:bg-gray-700 ${
                      pathname === item.href ? 'bg-gray-700 font-semibold' : ''
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" /> {/* Icon component */}
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* Optional: Add user profile or footer here */}
    </aside>
  );
} 