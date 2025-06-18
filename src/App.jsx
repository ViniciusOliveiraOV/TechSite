import ComplaintForm from './ComplaintForm';
import ComplaintList from './ComplaintList';

export default function App() {
  return (
    <div className="p-4 bg-pukeYellow min-h-screen font-retro">
      <h1 className="text-cyberBlue text-4xl mb-4 underline">🧰 Tech Complaint Portal</h1>
      <ComplaintForm />
      <hr className="border-retroGray my-4" />
      <span className="text-red-600 blink">🔥 Urgent!</span>
      <h2 className="text-2xl mb-2">All Complaints</h2>
      <ComplaintList />
      <footer className="mt-8 text-sm">© 1998 TechPortal.com</footer>
    </div>
  );
}
