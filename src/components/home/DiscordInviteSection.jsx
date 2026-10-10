import { MessageCircle } from 'lucide-react';

const DISCORD_URL = 'https://discord.gg/xtfdNZukN7';

export default function DiscordInviteSection() {
  return (
    <section className="home-discord-section">
      <div className="home-discord-card">
        <div className="home-discord-glow" />
        <div className="home-discord-content">
          <div className="home-discord-icon-wrap">
            <MessageCircle className="home-discord-icon" />
          </div>
          <div className="home-discord-text">
            <h3 className="home-discord-title">Join our Discord</h3>
            <p className="home-discord-desc">
              Connect with the community, get updates, and talk to the team.
            </p>
          </div>
          <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="home-discord-btn">
            Join Server
          </a>
        </div>
      </div>
    </section>
  );
}