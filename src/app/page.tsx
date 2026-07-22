import '@/styles/terminal-site.css';
import { SiteNav } from '@/components/terminal/SiteNav';
import { TerminalView } from '@/components/terminal/TerminalView';

export default function HomePage() {
  return (
    <>
      <SiteNav />
      <TerminalView />
    </>
  );
}
