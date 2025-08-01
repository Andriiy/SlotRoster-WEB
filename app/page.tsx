export default function HomePage() {
  return (
    <html>
      <head>
        <title>SlotRoster - Flight Club Management</title>
        <meta name="description" content="Manage your flight club aircraft, bookings, and members." />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            background-color: #ffffff; 
            color: #000000; 
          }
          .container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .content {
            text-align: center;
          }
          .title {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 1rem;
          }
          .subtitle {
            margin-bottom: 2rem;
            color: #666666;
          }
          .buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
          }
          .button {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            text-decoration: none;
            font-weight: 500;
          }
          .primary {
            background-color: #000000;
            color: #ffffff;
          }
          .secondary {
            background-color: #f3f4f6;
            color: #000000;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="content">
            <h1 className="title">
              SlotRoster
            </h1>
            <p className="subtitle">
              Flight Club Management Platform
            </p>
            <div className="buttons">
              <a 
                href="/sign-in" 
                className="button primary"
              >
                Sign In
              </a>
              <a 
                href="/sign-up" 
                className="button secondary"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 