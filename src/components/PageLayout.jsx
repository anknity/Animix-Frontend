import { Link } from 'react-router-dom';
import SidebarMenu from './SidebarMenu';

const PageLayout = ({
  children,
  rightSidebar,
  showRightSidebar = true,
  mainClassName = 'space-y-8',
  mobileTitle = 'AniVibe',
  mobileSubtitle = 'Discover anime daily',
  mobileAction
}) => {
  const gridTemplate = showRightSidebar && rightSidebar
    ? 'xl:grid-cols-[250px,1fr,320px]'
    : 'xl:grid-cols-[250px,1fr]';

  return (
    <div className="min-h-screen bg-dark-900 pb-12">
      <div className="px-4 pt-6 lg:pt-8">
        <div className="xl:hidden mb-6 flex items-center justify-between">
          <div>
            <p className="text-white text-xl font-extrabold">{mobileTitle}</p>
            {mobileSubtitle && (
              <p className="text-xs text-gray-400 uppercase tracking-[0.35em]">{mobileSubtitle}</p>
            )}
          </div>
          {mobileAction || (
            <Link
              to="/search"
              className="rounded-full bg-primary/90 px-4 py-2 text-sm font-semibold text-white shadow-lg"
            >
              Search
            </Link>
          )}
        </div>

        <div className={`max-w-[1500px] mx-auto grid gap-6 ${gridTemplate}`}>
          <SidebarMenu />

          <main className={mainClassName}>
            {children}
          </main>

          {showRightSidebar && rightSidebar ? rightSidebar : null}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;
