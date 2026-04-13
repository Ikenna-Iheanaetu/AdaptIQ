import { Terminal, Braces, Code2, Layers, Database, Server, Cpu, Network } from 'lucide-react';

interface Topic {
  label: string;
  icon: React.ElementType;
  iconClass: string;
}

const topics: Topic[] = [
  { label: 'Python',        icon: Terminal, iconClass: 'text-[#004ac6]'   },
  { label: 'JavaScript',    icon: Braces,   iconClass: 'text-yellow-500'  },
  { label: 'HTML/CSS',      icon: Code2,    iconClass: 'text-orange-500'  },
  { label: 'React',         icon: Layers,   iconClass: 'text-blue-400'    },
  { label: 'SQL',           icon: Database, iconClass: 'text-[#6a1edb]'   },
  { label: 'Node.js',       icon: Server,   iconClass: 'text-green-600'   },
  { label: 'Rust',          icon: Cpu,      iconClass: 'text-red-500'     },
  { label: 'System Design', icon: Network,  iconClass: 'text-[#004ac6]'   },
];

export default function TopicsSection() {
  return (
    <section className="bg-white py-28 lg:py-36">
      <div className="container mx-auto px-6 lg:px-16">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-[#141b2b]">
            What will you master today?
          </h2>
          <p className="text-[#434655] text-lg">
            Choose your stack and let AdaptIQ build your custom curriculum.
          </p>
        </div>

        {/* Pills Grid */}
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {topics.map(({ label, icon: Icon, iconClass }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 px-6 py-3 bg-[#e9edff] rounded-full border border-transparent hover:border-[#004ac6] hover:bg-[#f1f3ff] transition-all cursor-pointer group"
            >
              <Icon size={16} className={iconClass} />
              <span className="font-semibold text-[#141b2b] text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
